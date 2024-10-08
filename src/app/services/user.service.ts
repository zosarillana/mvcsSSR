import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { User } from '../models/user';
import { catchError } from 'rxjs/operators';
import { ChangePassDto } from '../models/change-pass.dto';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private url = '/api/api/User';

  constructor(private http: HttpClient) {}

  public getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.url}`);
  }

  public getUsersSearch(userId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.url}/users/${userId}`).pipe(
      catchError((error) => {
        console.error('Error fetching user:', error);
        return of([]); // Return an empty array on error
      })
    );
  }

  changePassword(userId: number, changePassDto: ChangePassDto): Observable<any> {
    const url = `${this.url}/change-password/${userId}`;
    const headers = new HttpHeaders({
        'Content-Type': 'application/json',
    });

    return this.http.post(url, changePassDto, { headers }).pipe(
        map(response => response), // Map response to ensure it is returned correctly                         
    );
}



  getUserCount(): Observable<number> {
    return this.http.get<number>(`${this.url}/count`);
  }

  public updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.url}/${user.id}`, user).pipe(
      catchError(this.handleError) // Use catchError inside pipe
    );
  }

  public createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.url}`, user).pipe(
      catchError(this.handleError) // Use catchError inside pipe
    );
  }

  // Method to delete a user by ID
  public deleteUser(userId: number): Observable<User[]> {
    return this.http.delete<User[]>(`${this.url}/${userId}`).pipe(
      catchError(this.handleError) // Use catchError inside pipe
    );
  }

  //   private handleError(error: HttpErrorResponse) {
  //     let errorMessage: any = {
  //       message: 'An unknown error occurred!',
  //     };

  //     if (error.error instanceof ErrorEvent) {
  //       // Client-side error
  //       errorMessage.message = `Error: ${error.error.message}`;
  //     } else {
  //       // Server-side error
  //       if (error.error && typeof error.error === 'object') {
  //         errorMessage = error.error;
  //       } else {
  //         errorMessage.message = `Error Code: ${error.status}\nMessage: ${error.message}`;
  //       }
  //     }

  //     return throwError(errorMessage);
  //   }
  // }

  private handleError(error: HttpErrorResponse) {
    let errorMessage: any = {
      message: 'An unknown error occurred!',
    };

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage.message = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 400 && error.error?.errors) {
        // Validation errors from the API (HTTP 400)
        errorMessage = error.error.errors; // Pass the validation errors directly
      } else if (error.error && typeof error.error === 'object') {
        // Other server-side errors
        errorMessage = error.error;
      } else {
        // Generic server error message
        errorMessage.message = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }

    return throwError(errorMessage);
  }
}
