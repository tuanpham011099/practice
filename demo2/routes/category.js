const { create, deleteCtg, listAllCtg, ctgDetail } = require('../controllers/category');
const router = require('express').Router();
const { upload } = require('../utils/uploadImg');

router.get('/', listAllCtg);
router.post('/', upload.single('thumbnail'), create);
router.get('/:ctgId', ctgDetail);
router.delete('/:id', deleteCtg);

module.exports = router;