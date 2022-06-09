const { create, deleteCtg, listAllCtg, ctgDetail } = require('../controllers/category');
const { isAdmin, auth } = require('../middlewares/auth');
const router = require('express').Router();
const { upload } = require('../utils/uploadImg');

router.get('/', listAllCtg);
router.post('/', auth, isAdmin, upload.single('thumbnail'), create);
router.get('/:ctgId', ctgDetail);
router.delete('/:id', auth, isAdmin, deleteCtg);

module.exports = router;