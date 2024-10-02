import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.Default, // Temporarily use Default strategy
})
export class LoginComponent implements OnInit {
  public errorMessage: string | null = null;
  public loading = false;
  public hide = true;
  public isLoading = true; // Start as true to show loading screen

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Log the initial state of isLoading
  

    // Simulate a delay for the loading screen (e.g., fetching data)
    setTimeout(() => {
      this.isLoading = false; // Set isLoading to false after the delay
    
    }, 1800); // Adjust the delay as needed
  }

  public togglePasswordVisibility(): void {
    this.hide = !this.hide;
  }

  public onEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault(); // Prevent the default action (e.g., form submission)
    keyboardEvent.stopPropagation(); // Stop the event from propagating further
  }

  public onSubmit(username: string, user_password: string): void {
    if (this.loading) return;
    this.loading = true;
  
    this.authService.login(username, user_password).subscribe(
      (response) => {
        if (response && response.token) {
          localStorage.setItem('jwtToken', response.token);
  
          const decodedToken = this.authService.decodeToken(response.token);
          const userRoleId = decodedToken?.role_id;
  
          const roleIdAsNumber = Number(userRoleId);
  
          if (roleIdAsNumber === 2) {
            this.router.navigate(['/dashboard/visits'])
              .then(() => {
                this.loading = false;
              })
              .catch(() => {
                this.errorMessage = 'An error occurred during navigation.';
                this.loading = false;
              });
          } else {
            this.router.navigate(['/dashboard'])
              .then(() => {
                this.loading = false;
              })
              .catch(() => {
                this.errorMessage = 'An error occurred during navigation.';
                this.loading = false;
              });
          }
        } else {
          this.errorMessage = 'Login failed. Please check your username and password.';
          this.loading = false;
        }
      },
      (error) => {
        // Safely check for the 'Invalid credentials' error
        if (error?.error?.errors?.general?.length) {
          this.errorMessage = error.error.errors.general[0]; // Shows 'Invalid credentials'
        } else {
          this.errorMessage = 'Login failed. Please check your username and password.';
        }
        this.loading = false;
      }
    );
  }
}    