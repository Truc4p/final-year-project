const express = require('express');
const router = express.Router();
const referralProgramController = require('../../controllers/marketing/referralProgramController');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

// All routes require admin authentication
router.use(auth);
router.use(role(['admin']));

// Program routes
router.get('/programs', referralProgramController.getPrograms);
router.get('/programs/:id', referralProgramController.getProgram);
router.post('/programs', referralProgramController.createProgram);
router.put('/programs/:id', referralProgramController.updateProgram);
router.delete('/programs/:id', referralProgramController.deleteProgram);

// Analytics routes
router.get('/programs/:id/analytics', referralProgramController.getProgramAnalytics);
router.get('/leaderboard', referralProgramController.getLeaderboard);

module.exports = router;
