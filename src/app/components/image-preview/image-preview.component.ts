import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-image-preview',
  templateUrl: './image-preview.component.html',
  styleUrls: ['./image-preview.component.css']
})
export class ImagePreviewComponent {
  @Input() imageSrc: string = '';
  @Output() close = new EventEmitter<void>();  // Emit event to notify parent to close modal

  isVisible: boolean = false;

  // Open modal function (though this might be managed by the parent now)
  openModal(imageSrc: string) {
    this.imageSrc = imageSrc;
    this.isVisible = true;
  }

  // Close modal and emit the event
  closeModal() {
    this.isVisible = false;
    this.close.emit();  // Notify parent component to close the modal
  }
}
