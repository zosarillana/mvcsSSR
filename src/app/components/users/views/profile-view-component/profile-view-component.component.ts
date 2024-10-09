import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TokenService } from '../../../../services/token.service';
import { ModalChangepassComponent } from './modal/modal-changepass/modal-changepass.component';

@Component({
  selector: 'app-profile-view-component',
  templateUrl: './profile-view-component.component.html',
  styleUrls: ['./profile-view-component.component.css']  // Correct the typo: `styleUrl` to `styleUrls`
})
export class ProfileViewComponentComponent implements OnInit {
  user: any = null;
  username: string | null = null;

  constructor(
    public dialog: MatDialog,
    public tokenService: TokenService
  ) {}

  ngOnInit(): void {
    // Decode token and set user information
    this.tokenService.decodeTokenAndSetUser();
    this.user = this.tokenService.getUser();
    this.username = this.user ? this.user.sub : null;
  }

  openChangePass(): void {
    // console.log('User ID:', this.user.id); // Ensure this is the correct value
    
    const dialogRef = this.dialog.open(ModalChangepassComponent, {
      width: '500px',
      height: 'auto',
      data: { userId: this.user.id }, // Pass the user.id here
    });
     
  }
}  
