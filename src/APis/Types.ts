export type OrganizationRegistrationPayload = {
  name: string;
  email: string;
  mobile: string;
  role: string;
  device_type: string;
  device_id: string;
  frontend_type: string;
  time_zone?: string;
};

export type OrganizationSuccessResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    request_id: string;
    otp_id: string;
  };
};

export type VerifyOtpPayload =  {
  request_id: string;
  otp_id: string;
  otp: string;
  device_type: string;
  device_id: string;
  frontend_type: string;
}

export type VerifyOtpResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    verified: boolean;
  };
}

export type ResendOtpPayload = {
  request_id: string;
  device_type: string;
  device_id: string;
  frontend_type: string;
}

export type ResendOtpResponse = {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    otp_id: string;
  };
}

export type OrganizationAddPayloads = {
  organization_name: string;
  center_name: string;
  is_clinic: number;
  is_diagnostic: number;
  primary_contact: string;
  secondary_contact?: string;
  branch_email: string;
  address: {
    address: string;
    lat: string;
    lng: string;
    postalCode: string;
  };
};




