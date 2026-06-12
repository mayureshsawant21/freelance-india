const router = require('express').Router();
const { createJob, getJobs, getJobById } = require('../controllers/jobController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize('employer'), createJob);
router.get('/', getJobs);
router.get('/:id', getJobById);
module.exports = router;