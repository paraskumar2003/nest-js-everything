import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

@Injectable()
export class SmsService {
  constructor(private configService: ConfigService) {}

  async sendOtp(mobile: string, otp: number): Promise<boolean> {
    try {
      let payload = {
        filetype: 2,
        thirdpartyrefno: "Campaign_Name",
        msisdn: [mobile],
        language: 0,
        credittype: 7,
        senderid: "TCHALM",
        templateid: 0,
        message: ` Your happy code for participation is ${otp}. Regards, Team Almonds `,
        ukey: this.configService.get("UKEY"),
        isrefno: true,
      };
      const response = await axios.post(
        `${this.configService.get("SMS_API_URL")}/VoicenSMS/webresources/CreateSMSCampaignPost`,
        payload
      );

      console.log("SMS sent successfully:", response.data, payload);

      return response.status === 200;
    } catch (error) {
      console.error("SMS sending failed:", error);
      return false;
    }
  }
}

