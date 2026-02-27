import { Router } from 'express';
import multer from 'multer';
import { documentsDir } from '../config/storage';
import {
  createBusinessUser,
  getBusinessUser,
} from '../controllers/business-user.controller';

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, documentsDir);
  },
  filename: (req, file, cb) => {
    const uid = (req as { uid?: string }).uid ?? 'unknown';
    cb(null, `${uid}-${file.fieldname}.pdf`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const isPdf =
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/x-pdf';
    if (!isPdf) {
      cb(new Error('Only PDF files are allowed'));
      return;
    }
    cb(null, true);
  },
});

/**
 * @openapi
 * /business-user:
 *   post:
 *     summary: Create business user account
 *     description: Creates a business user account. All fields (including non-file fields) are sent as multipart/form-data.
 *     tags:
 *       - BusinessUser
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - businessName
 *               - businessEntitiyType
 *               - companyRegistration
 *               - dateOfIncorporation
 *               - ownerName
 *               - ownerShipPercentage
 *               - phoneNumber
 *               - certificateOfIncorporation
 *               - addressProof
 *             properties:
 *               businessName:
 *                 type: string
 *               businessEntitiyType:
 *                 type: string
 *               companyRegistration:
 *                 type: string
 *               dateOfIncorporation:
 *                 type: string
 *               ownerName:
 *                 type: string
 *               ownerShipPercentage:
 *                 type: number
 *               phoneNumber:
 *                 type: string
 *               certificateOfIncorporation:
 *                 type: string
 *                 format: binary
 *               addressProof:
 *                 type: string
 *                 format: binary
 *           encoding:
 *             certificateOfIncorporation:
 *               contentType: application/pdf
 *             addressProof:
 *               contentType: application/pdf
 *     responses:
 *       201:
 *         description: Business user created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Missing or invalid Authorization header
 */
router.post(
  '/',
  upload.fields([
    { name: 'certificateOfIncorporation', maxCount: 1 },
    { name: 'addressProof', maxCount: 1 },
  ]),
  createBusinessUser
);

/**
 * @openapi
 * /business-user/{id}:
 *   get:
 *     summary: Get business user account
 *     description: Returns a business user account by ID
 *     tags:
 *       - BusinessUser
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Business user details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid business user ID
 *       401:
 *         description: Missing or invalid Authorization header
 *       404:
 *         description: Business user not found
 */
router.get('/:id', getBusinessUser);

export default router;
