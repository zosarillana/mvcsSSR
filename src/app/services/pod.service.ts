import { Injectable } from '@angular/core';
import { Pod } from '../models/pod';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PodService {
  private url = 'api/Pod';

  constructor(private http: HttpClient) {}

  public getPods(): Observable<Pod[]> {
    return this.http.get<Pod[]>(`${this.url}`);
  }

  public updatePods(formData: FormData): Observable<Pod> {
    return this.http.put<Pod>(`${this.url}/update`, formData);
  }
  createPods(formData: FormData): Observable<Pod> {
    return this.http.post<Pod>(`${this.url}/upload`, formData);
  }
  public deletePods(mvisit: Pod): Observable<Pod[]> {
    return this.http.delete<Pod[]>(`${this.url}/${mvisit.id}`);
  }

  getPodsCount(): Observable<number> {
    return this.http.get<number>(`${this.url}/count`);
  }
}
