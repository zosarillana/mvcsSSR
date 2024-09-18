import { Injectable } from '@angular/core';
import { MarketVisits } from '../models/market-visits';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MarketVisitsService {
  private url = 'api/MarketVisits';

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
  

  private createAuthorizationHeader(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');
    return token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
  }
}
