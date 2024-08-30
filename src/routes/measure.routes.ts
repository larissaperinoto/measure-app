import { Router } from "express";
import MeasureController from "../controllers/measure.controller";
import { createMeasureValidator } from "../middlewares/measure.create.middleware";
import { confirmMeasureValidator } from "../middlewares/measure.confirm.middleware";
import { getMeasureValidator } from "../middlewares/measure.get.middleware";

const router = Router();

const controller = new MeasureController();

/**
 * @openapi
 * /{customer_code}/list:
 *   get:
 *     summary: Retorna uma lista de medidas para um cliente
 *     parameters:
 *       - name: customer_code
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: measure_type
 *         in: query
 *         schema:
 *           type: string
 *           enum: [WATER, GAS]
 *           description: Tipo de medida
 *     responses:
 *       200:
 *         description: Lista de medidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customer_code:
 *                   type: string
 *                 measures:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       measure_uuid:
 *                         type: string
 *                       measure_datetime:
 *                         type: string
 *                         format: date-time
 *                       measure_type:
 *                         type: string
 *                       has_confirmed:
 *                         type: boolean
 *                       image_url:
 *                         type: string
 *       400:
 *         description: Requisição inválida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: string
 *                 error_description:
 *                   type: string
 *             examples:
 *               application/json:
 *                 value: {
 *                   "error_code": "INVALID_TYPE",
 *                   "error_description": "Tipo de medição não permitida"
 *                 }
 *       404:
 *         description: Medidas não encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: string
 *                 error_description:
 *                   type: string
 *             examples:
 *               application/json:
 *                 value: {
 *                   "error_code": "MEASURES_NOT_FOUND",
 *                   "error_description": "Nenhuma leitura encontrada"
 *                 }
 */
router.get(
  "/:customer_code/list",
  getMeasureValidator,
  controller.getMeasure.bind(controller)
);

/**
 * @openapi
 * /public/{measure_uuid}:
 *   get:
 *     summary: Retorna a imagem da medida
 *     parameters:
 *       - name: measure_uuid
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Imagem da medida
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Imagem não encontrada
 */
router.get("/public/:measure_uuid", controller.getImage.bind(controller));

/**
 * @openapi
 * /upload:
 *   post:
 *     summary: Cria uma nova medida
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 description: Imagem do medido em base64
 *               customer_code:
 *                 type: string
 *               measure_datetime:
 *                 type: string
 *                 format: date-time
 *               measure_type:
 *                 type: string
 *                 enum: [WATER, GAS]
 *     responses:
 *       200:
 *         description: Medida criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 image_url:
 *                   type: string
 *                 measure_value:
 *                   type: number
 *                 measure_uuid:
 *                   type: string
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: string
 *                 error_description:
 *                   type: string
 *             examples:
 *               application/json:
 *                 value: {
 *                   "error_code": "INVALID_DATA",
 *                   "error_description": "Descrição do erro"
 *                 }
 *       409:
 *         description: Medida já existente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: string
 *                 error_description:
 *                   type: string
 *             examples:
 *               application/json:
 *                 value: {
 *                   "error_code": "DOUBLE_REPORT",
 *                   "error_description": "Leitura do mês já realizada"
 *                 }
 */
router.post(
  "/upload",
  createMeasureValidator,
  controller.createMeasure.bind(controller)
);

/**
 * @openapi
 * /confirm:
 *   patch:
 *     summary: Confirma uma medida existente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               measure_uuid:
 *                 type: string
 *               confirmed_value:
 *                 type: number
 *     responses:
 *       200:
 *         description: Medida confirmada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: string
 *                 error_description:
 *                   type: string
 *             examples:
 *               application/json:
 *                 value: {
 *                   "error_code": "INVALID_DATA",
 *                   "error_description": "Descrição do erro"
 *                 }
 *       404:
 *         description: Medida não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: string
 *                 error_description:
 *                   type: string
 *             examples:
 *               application/json:
 *                 value: {
 *                   "error_code": "MEASURE_NOT_FOUND",
 *                   "error_description": "Leitura do mês já realizada"
 *                 }
 *       409:
 *         description: Confirmação duplicada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: string
 *                 error_description:
 *                   type: string
 *             examples:
 *               application/json:
 *                 value: {
 *                   "error_code": "CONFIRMATION_DUPLICATE",
 *                   "error_description": "Leitura do mês já realizada"
 *                 }
 */
router.patch(
  "/confirm",
  confirmMeasureValidator,
  controller.updateMeasure.bind(controller)
);

export default router;
