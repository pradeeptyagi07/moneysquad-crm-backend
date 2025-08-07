import express from 'express'
import {altMoneyController} from "../controllers/altMoney/altMoney.controller"


const router = express.Router();
router.post('/enquiry', altMoneyController.sendEnquiryMessage);
router.post('/apply-loan' , altMoneyController.sendLoanInquiryMessage)
router.post('/ai-engine-interest' , altMoneyController.sendAIEngineInterest)

export default router