import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replaceBackslashes',
  standalone: true
})
export class ReplaceBackslashesPipe implements PipeTransform {

  transform(value: string): string {
    return value.replace(/\\/g, '/'); 
    // return value.replaceAll("\\", "/"); 
  }

}
