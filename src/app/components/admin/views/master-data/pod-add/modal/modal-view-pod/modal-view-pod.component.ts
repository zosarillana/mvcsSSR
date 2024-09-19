import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { environment } from '../../../../../../../../environments/environment';
import { Pod } from '../../../../../../../models/pod';

@Component({
  selector: 'app-modal-view-pod',
  templateUrl: './modal-view-pod.component.html',
  styleUrl: './modal-view-pod.component.css'
})
export class ModalViewPodComponent {
  @Input() pods?: Pod;
  @Output() PodUpdated = new EventEmitter<Pod[]>();

  imageFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  errorMessages: { [key: string]: string[] } = {};

  constructor(   
    public dialogRef: MatDialogRef<ModalViewPodComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  // Construct the base API URL
  private url = '/api/api/Pod';
  public imageUrlBase = `${this.url}/image/`; 


  onNoClick(): void {
    this.dialogRef.close();
  }
}