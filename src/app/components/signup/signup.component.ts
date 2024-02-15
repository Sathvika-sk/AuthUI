import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent implements OnInit{
  signupForm!:FormGroup
  constructor(
    private fb: FormBuilder, 
    private auth:AuthService,
    private toastr: ToastrService
    ){ }
    
    ngOnInit(): void{
      this.signupForm=this.fb.group({
        name:['',Validators.required],
        email:['',Validators.required],
        phone:['',Validators.required],
        salary:['',Validators.required],
        department:['',Validators.required],
        password:['',Validators.required]
      })
    }
    onSubmit(){
      if(this.signupForm.valid){
        console.log(this.signupForm.value)
      }
      else{
        this.toastr.error('Error','Form is not valid!')
        
      this.validateAllFormFields(this.signupForm);
      this.toastr.error('Error','Form is not valid!')
        
    }
  }
  onSignup(){
    if(this.signupForm.valid){
      this.auth.signUp(this.signupForm.value)
      .subscribe({
        next:(res=>{
          
          this.toastr.success('Congratulations!','You have successfully signed up!')
        
          this.signupForm.reset();
        })
        ,error:(err=>{
          this.toastr.error(err?.error.message,'Error',{
            toastClass:'toast-error',
          });
          
        })
      })
    }
    else{
      
      this.validateAllFormFields(this.signupForm);
      this.toastr.error('Error','Your form is invalid!')
    }
  }
  private validateAllFormFields(formGroup:FormGroup){
    Object.keys(formGroup.controls).forEach(field=>{
      const control = formGroup.get(field);
      if(control instanceof FormControl){
        control.markAsDirty({onlySelf:true})
      }else if(control instanceof FormGroup){
        this.validateAllFormFields(control)
      }
      
    })
  }
  
}

