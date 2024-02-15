import { CanActivateFn,ActivatedRouteSnapshot,RouterStateSnapshot,Router,CanActivateChildFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Injectable, inject } from '@angular/core';




export const AuthGuard: CanActivateFn = (route, state) => {
  const auth= inject(AuthService);
  const rout=inject(Router);
  canActivate:Boolean()
  {
  if(auth.isloggedIn()){
    return true;
  } else{
    alert("Please Login First.")
    rout.navigate(['login']);
    return false;
  }
}
};

function canActivate() {
  throw new Error('Function not implemented.');
}
/*
export class AuthGuard implements CanActivate
{
  constructor(private auth: AuthService,private router:Router){

  }
  canActivate(route:ActivatedRouteSnapshot,state: RouterStateSnapshot):boolean{
    if(this.auth.isloggedIn()){
      return true
    }else{
      alert("Please Login First.")
      this.router.navigate(['login'])
      return false;
    }
    };

  }
*/
