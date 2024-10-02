import { Injectable } from '@angular/core';
import { MarketVisits } from '../models/market-visits';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MarketVisitsService {
  private url = '/api/api/MarketVisits';

  constructor(private http: HttpClient) {}

  public getMarketVisits(): Observable<MarketVisits[]> {
    return this.http.get<MarketVisits[]>(`${this.url}`);
  }

  public updateMarketVisits(
    id: number,
    formData: FormData
  ): Observable<MarketVisits> {
    return this.http.put<MarketVisits>(
      `${this.url}/${id}`,
      formData
    );
  }  

   // New method to update the status of a MarketVisit to "Submitted"
   public updateMarketVisitStatusSubmitted(id: number): Observable<MarketVisits> {
    return this.http.put<MarketVisits>(`${this.url}/${id}/status/submitted`, {});
  }
   // New method to update the status of a MarketVisit to "Submitted"
   public updateMarketVisitStatusApproved(id: number): Observable<MarketVisits> {
    return this.http.put<MarketVisits>(`${this.url}/${id}/status/approved`, {});
  }
   // New method to update the status of a MarketVisit to "Submitted"
   public updateMarketVisitStatusRecalled(id: number): Observable<MarketVisits> {
    return this.http.put<MarketVisits>(`${this.url}/${id}/status/recalled`, {});
  }

  getVisitById(id: string): Observable<MarketVisits> {
    return this.http.get<MarketVisits>(
      `${this.url}/${id}`
    );
  }

  public createMarketVisits(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.url}`, formData);
  }

  public deleteMarketVisits(mvisit: MarketVisits): Observable<MarketVisits[]> {
    return this.http.delete<MarketVisits[]>(
      `${this.url}/${mvisit.id}`
    );
  }

  public getVisitCount(): Observable<number> {
    // This endpoint does not require authentication
    return this.http.get<number>(`${this.url}/count`).pipe(
      catchError(error => {
        // Handle errors if needed
        return throwError(() => new Error(error.message));
      })
    );
  }

  public getChartData(): Observable<{ year: number; month: number; count: number }[]> {
    return this.http.get<{ year: number; month: number; count: number }[]>(`${this.url}/chart-data`).pipe(
      catchError(error => {
        // Handle errors if needed
        return throwError(() => new Error(error.message));
      })
    );
  }
  public getChartDataUser(): Observable<{ year: number; month: number; count: number }[]> {
    return this.http.get<{ year: number; month: number; count: number }[]>(`${this.url}/chart-data/user`).pipe(
      catchError(error => {
        // Handle errors if needed
        return throwError(() => new Error(error.message));
      })
    );
  }
  
//   getVisitCountUser(userId: number): Observable<number> {
//     return this.http.get<number>(`/api/count/user/${userId}`);
// }
  public getVisitCountUser(): Observable<number> {
    // This endpoint does not require authentication
    return this.http.get<number>(`${this.url}/count/user`).pipe(
      catchError(error => {
        // Handle errors if needed
        return throwError(() => new Error(error.message));
      })
    );
  }

  getVisitCountForUser(userId: number): Observable<number> {
    return this.http.get<number>(`${this.url}/count/user?userId=${userId}`);
  }
  

  private createAuthorizationHeader(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');
    return token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
  }
}
