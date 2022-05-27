const { create, deleteCtg, listAllCtg, ctgDetail } = require('../controllers/category');
const { isAdmin,auth } = require('../middlewares/auth');
const router = require('express').Router();
const { upload } = require('../utils/uploadImg');

router.get('/', listAllCtg);
router.post('/', auth, upload.single('thumbnail'), create);
router.get('/:ctgId', auth, ctgDetail);
router.delete('/:id',auth, deleteCtg);

module.exports = router;