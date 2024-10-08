export class User {
    id?: number;
    user_id?: number; // Add this line if you want to use user_id
    abfi_id = "";
    role?: number;
    fname = "";
    mname = "";   
    lname = "";
    email_add = "";
    contact_num = "";
    username = "";
    password = "";
    date_created = ''; // Add this line
    date_updated = ''; // Add this line
    roles: Array<{
      id: number;
      role_id: string;
      role_name: string;
      role_description: string;      
    }> = [];
  }
  