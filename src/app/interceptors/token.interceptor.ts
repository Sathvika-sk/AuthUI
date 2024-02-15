import { HttpEvent, HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class tokenInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService, private router: Router) {}

  intercept(
    request:HttpRequest<unknown>, next:HttpHandler): Observable<HttpEvent<unknown>>{
      const myToken = this.auth.getToken();

      if(myToken){
        request=request.clone({
          setHeaders: {Authorization:`Bearer ${myToken}`}
        })
      }

      return next.handle(request);
      catchError((err: any)=>{
          if(err instanceof HttpErrorResponse){
            if(err.status ===401){
              alert("The token expired!")
              this.router.navigate(['login'])
            }
          }
          return throwError(()=> new Error("Some other error occured"))
        })
  }
};
