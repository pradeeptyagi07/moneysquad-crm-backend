import { Request, Response } from 'express';
import { offerService } from '../../services/offer/offer.service';
import { Offer } from '../../model/offer.model';

export const offerController = {
  async create(req: Request, res: Response) {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const offer = await offerService.createOffer(req.body, files);
      res.status(201).json({ success: true, data: offer });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getAllOffers(req: Request, res: Response) {
    const offers = await offerService.getAllOffers();
    res.status(200).json({ success: true, data: offers });
  },

  async getOfferById(req: Request, res: Response) {
    const { id } = req.params;
    const offers = await offerService.getOfferById(id);
    res.status(200).json({ success: true, data: offers });
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const updated = await offerService.updateOffer(id, req.body, files);
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await offerService.deleteOffer(id);
      res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getLoanTypes(req: Request, res: Response) {
    try {
      const types = await offerService.getLoanTypes();
      res.status(200).json({ success: true, data: types });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async createLoanTypes(req: Request, res: Response) {
    try {
      const { name } = req.body;
      const types = await offerService.createLoanTypes(name);
      res.status(200).json({ success: true, data: types });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async createLender(req: Request, res: Response) {
    try {
      const { name } = req.body;
      const types = await offerService.createLender(name);
      res.status(200).json({ success: true, data: types });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getLenders(req: Request, res: Response) {
    try {
      const lenders = await offerService.getLenders();
      res.status(200).json({ success: true, data: lenders });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },


  async shareOfferViaWhatsApp(req: Request, res: Response) {
    try {
      const offerId = req.params.id;
      const phoneNumber = req.query.phone as string;
      const offer = await Offer.findById(offerId);

      const message = `
                      *${offer?.bankName} - ${offer?.offerHeadline}*\n
                      Loan Type: ${offer?.loanType}
                      Interest Rate: ${offer?.interestRate}%
                      Processing Fee: ₹${offer?.processingFee}
                      `;

      const encodedMsg = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMsg}`;
      console.log(whatsappUrl)
      return res.redirect(whatsappUrl);

      // res.status(200).json({
      //   success: true,
      //   url: whatsappUrl,
      // });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

};
