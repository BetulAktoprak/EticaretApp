import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ToastrModule } from 'ngx-toastr';

import { routes } from './app.routes';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ReplaceBackslashesPipe } from './components/products/components/products/replace-backslashes.pipe';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(
      BrowserModule,
      CommonModule,
      NgxSpinnerModule,
      SweetAlert2Module,
      BrowserAnimationsModule,
      ToastrModule.forRoot({
        closeButton: true,
        progressBar: true
      }),
      RouterModule.forRoot(routes),
      ReplaceBackslashesPipe
    )
  ]
};
