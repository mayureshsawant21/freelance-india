import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

let socket: any;

export default function ChatRoom() {
  const router = useRouter();
  const { connectionId } = router.query;
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');

  useEffect(() => {
    if (!connectionId) return;
    const token = localStorage.getItem('token');
    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL!, { auth: { token } });
    socket.emit('join_chat', connectionId);
    socket.on('chat_history', (msgs: any) => setMessages(msgs));
    socket.on('new_message', (msg: any) => setMessages(prev => [...prev, msg]));
    return () => { socket.disconnect(); };
  }, [connectionId]);

  const send = () => {
    if (!newMsg.trim()) return;
    socket.emit('send_message', { connectionId, content: newMsg, messageType: 'text' });
    setNewMsg('');
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(msg => (
          <div key={msg.id} className={`mb-2 ${msg.sender_id === user.id ? 'text-right' : ''}`}>
            <p className={`inline-block p-3 rounded-lg ${msg.sender_id === user.id ? 'bg-primary text-white' : 'bg-gray-200'}`}>
              {msg.content}
            </p>
          </div>
        ))}
      </div>
      <div className="p-4 border-t flex">
        <Input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyPress={e => e.key === 'Enter' && send()} placeholder="Type a message..." />
        <Button onClick={send} className="ml-2 bg-primary text-white">Send</Button>
      </div>
    </div>
  );
}