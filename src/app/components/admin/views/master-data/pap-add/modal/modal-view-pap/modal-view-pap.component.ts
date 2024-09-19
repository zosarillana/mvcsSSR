import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from '../../../../../../../../environments/environment';
import { Pap } from '../../../../../../../models/pap';

@Component({
  selector: 'app-modal-view-pap',
  templateUrl: './modal-view-pap.component.html',
  styleUrl: './modal-view-pap.component.css'
})
export class ModalViewPapComponent {
  @Input() pods?: Pap;
  @Output() PodUpdated = new EventEmitter<Pap[]>();

  imageFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  errorMessages: { [key: string]: string[] } = {};

  constructor(   
    public dialogRef: MatDialogRef<ModalViewPapComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  // Construct the base API URL
  private url = '/api/api/Pap';
  public imageUrlBase = `${this.url}/image/`; 


  onNoClick(): void {
    this.dialogRef.close();
  }
}