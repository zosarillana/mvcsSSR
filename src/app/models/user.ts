export class User {
    id?: number;
    abfi_id = "";
    role?: number;
    fname = "";
    mname = "";   
    lname = "";
    email_add = "";
    contact_num = "";
    username = "";
    password = "";
    dateCreated = ''; // Add this line
    dateUpdated = ''; // Add this line
    roles: Array<{
      id: number;
      role_id: string;
      role_name: string;
      role_description: string;      
    }> = [];
  }
  