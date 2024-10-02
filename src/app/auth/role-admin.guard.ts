import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

@Injectable({
  providedIn: 'root'
})

export class roleAdminGuard implements CanActivate {
constructor(private tokenService: TokenService, private router: Router) {}

canActivate(): boolean {
  this.tokenService.decodeTokenAndSetUser(); // Decode token and set user
  const user = this.tokenService.getUser();

  if (user && user.role_id === '2') { // Check if user role_id is '1'
    return true;
  } else {
    this.router.navigate(['/404']); // Redirect to 404 page
    return false;
  }
}
}