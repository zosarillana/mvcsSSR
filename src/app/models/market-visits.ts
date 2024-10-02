export class MarketVisits {
  id?: number;
  mv_id = '';
  user_id = '';
  visit_date = '';
  area_id: string[] = []; // Changed from string to string[]
  visit_accountName = '';
  visit_distributor = '';
  visit_salesPersonnel = '';
  visit_accountType = '';
  visit_accountType_others = '';
  isr_id: string[] = []; // Changed from string to string[]
  isr_reqOthers = '';
  isr_req_ImgPath = '';
  isr_needsOthers = '';
  isr_needs_ImgPath = '';
  status = '';
  data_status = '';
  visit_payolaSupervisor = '';
  visit_payolaMerchandiser = '';
  visit_payolaContactNumber = '';
  visit_averageOffTakePd = '';
  pod_id: string[] = []; // Changed from string to string[]
  pod_canned_other = '';
  pod_mpp_other = '';
  visit_competitorsCheck = '';
  pap_id: string[] = []; // Changed from string to string[]
  pap_others = '';
  date_created = '';
  date_updated = '';
  areas: Array<{
    area_id: number;
    area_name: string;
    area_description: string;
    area_dateCreated: string;
    area_dateUpdated: string;
  }> = [];
  isrs: Array<{
    isr_id: number;
    isr_type: string;
    isr_name: string;
    isr_description: string;
    isr_dateCreated: string;
    isr_dateUpdated: string;
  }> = [];
  pods: Array<{
    pod_id: number;
    pod_type: string;
    pod_name: string;
    pod_description: string;
    pod_dateCreated: string;
    pod_dateUpdated: string;
  }> = [];
  paps: Array<{
    pap_id: number;
    pap_name: string;
    pap_description: string;
    pap_dateCreated: string;
    pap_dateUpdated: string;
  }> = [];
  accountTypes: Array<{
    accountType_id: number;
    accountType_name: string;
    accountType_description: string;
    accountType_dateCreated: string;
    accountType_dateUpdated: string;
  }> = [];
  user: {  
    user_id: number;
    abfi_id: string;
    role_id?: number;
    fname: string; 
    mname: string;  
    lname: string; 
    email_add: string;
    contact_num: string;
    username: string;    
    date_created?: Date; 
    date_updated?: Date; 
  } = {  
    user_id: 0,
    abfi_id: '',
    fname: '',
    mname: '',
    lname: '',
    email_add: '',
    contact_num: '',
    username: ''
  };
}
