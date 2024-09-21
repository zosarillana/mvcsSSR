import { Component, EventEmitter, OnInit, Output, Input, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { PodService } from '../../../../services/pod.service';
import { Pod } from '../../../../models/pod';
import { IsrService } from '../../../../services/isr.service';
import { Isr } from '../../../../models/isr';
import { Pap } from '../../../../models/pap';
import { PapService } from '../../../../services/pap.service';
import { Area } from '../../../../models/area';
import { AreaService } from '../../../../services/area.service';
import { MarketVisits } from '../../../../models/market-visits';
import { MarketVisitsService } from '../../../../services/market-visits.service';
import { TokenService } from '../../../../services/token.service';

@Component({
  selector: 'app-add-visits',
  templateUrl: './add-visits.component.html',
  styleUrls: ['./add-visits.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddVisitsComponent implements OnInit {
  @Input() data?: MarketVisits;
  @Output() MarketVisitsUpdated = new EventEmitter<MarketVisits[]>();

  user_id: string | null = null;
  abfi_id: string | null = null;
  imageFileReq: File | null = null;
  imagePreviewReq: string | ArrayBuffer | null = null;
  imageFileNeed: File | null = null;
  imagePreviewNeed: string | ArrayBuffer | null = null;
  
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  fourthFormGroup: FormGroup;
  fifthFormGroup: FormGroup;
  sixthFormGroup: FormGroup;

  pods: Pod[] = [];
  cannedPods: Pod[] = [];
  mppPods: Pod[] = [];

  isrs: Isr[] = [];
  isrRequirements: Isr[] = [];
  isrNeeds: Isr[] = [];

  areas: Area[] = [];
  paps: Pap[] = [];

  accountType: string[] = [
    'General Trade',
    'Modern Trade',
    'Local Key Account',
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private marketVisitsService: MarketVisitsService,
    private _podService: PodService,
    private _isrService: IsrService,
    private _papService: PapService,
    private _areaService: AreaService,
    private fb: FormBuilder,
    private tokenService: TokenService
  ) {
    // Form initialization
    this.firstFormGroup = this.fb.group({
      user_id: [''],
      visit_date: [''],
      area_id: this.fb.array([]),
    });
    this.secondFormGroup = this.fb.group({
      visit_accountName: [''],
      visit_distributor: [''],
      visit_salesPersonnel: [''],
      visit_accountType_others: [''],
      visit_accountType: this.fb.array([]),
    });
    this.thirdFormGroup = this.fb.group({
      isr_id: this.fb.array([]),
      isr_reqOthers: [''],
      isr_req_ImgPath: [''],
      isr_needsOthers: [''],
      isr_needs_ImgPath: [''],
    });
    this.fourthFormGroup = this.fb.group({
      visit_payolaMerchandiser: [''],
      visit_payolaSupervisor: [''],
      visit_averageOffTakePd: [''],
    });
    this.fifthFormGroup = this.fb.group({
      pod_id: this.fb.array([]),
      cannedPodOthers: [''],
      mppPodOthers: [''],
    });
    this.sixthFormGroup = this.fb.group({
      pap_id: this.fb.array([]),
      visit_competitorsCheck: [''],
      pap_others: [''],
    });
  }

  ngOnInit(): void {
    this.tokenService.decodeTokenAndSetUser(); // Decode the token and set user information
    const user = this.tokenService.getUser();
    this.user_id = user?.id ?? null;
    this.abfi_id= user?.abfi_id ?? null;
    this.firstFormGroup.patchValue({ user_id: this.user_id, abfi_id: this.abfi_id });

    this.getPodData();
    this.getIsrsData();
    this.loadAreas();
    this.loadPaps();

    // Initialize visit_accountType array
    this.accountType.forEach(() => {
      (this.secondFormGroup.get('visit_accountType') as FormArray).push(new FormControl(false));
    });
  }

  getPodData(): void {
    this._podService.getPods().subscribe(
      (data: Pod[]) => {
        this.pods = data;
        this.filterPods();
        this.updatePodControls();
      },
      (error) => console.error('Error fetching pods:', error)
    );
  }

  getIsrsData(): void {
    this._isrService.getIsrs().subscribe(
      (data: Isr[]) => {
        this.isrs = data;
        this.filterIsrs();
        this.updateIsrControls();
      },
      (error) => console.error('Error fetching ISRs:', error)
    );
  }

  loadAreas(): void {
    this._areaService.getAreas().subscribe(
      (areas) => {
        this.areas = areas;
        this.setControls(this.firstFormGroup.get('area_id') as FormArray, this.areas);
      },
      (error) => console.error('Error fetching areas:', error)
    );
  }

  loadPaps(): void {
    this._papService.getPaps().subscribe(
      (paps) => {
        this.paps = paps;
        this.setControls(this.sixthFormGroup.get('pap_id') as FormArray, this.paps);
      },
      (error) => console.error('Error fetching paps:', error)
    );
  }

  filterPods(): void {
    this.cannedPods = this.pods.filter(pod => pod.pod_type === 'CANNED');
    this.mppPods = this.pods.filter(pod => pod.pod_type === 'MPP');
  }

  filterIsrs(): void {
    this.isrRequirements = this.isrs.filter(isr => isr.isr_type === 'REQUIREMENTS');
    this.isrNeeds = this.isrs.filter(isr => isr.isr_type === 'NEEDS');
  }

  updatePodControls(): void {
    this.updateControls(this.fifthFormGroup.get('pod_id') as FormArray, this.pods);
  }

  updateIsrControls(): void {
    this.updateControls(this.thirdFormGroup.get('isr_id') as FormArray, this.isrs);
  }

  updateControls(formArray: FormArray, items: any[]): void {
    formArray.clear();
    items.forEach(() => formArray.push(new FormControl(false)));
    this.cdr.detectChanges(); // Ensure change detection
  }

  setControls(formArray: FormArray, items: any[]): void {
    formArray.clear();
    items.forEach(() => formArray.push(new FormControl(false)));
    this.cdr.detectChanges(); // Ensure change detection
  }

  prepareFormData(): FormData {
    const formData = new FormData();
  
    const appendFormGroupValues = (formGroup: FormGroup, prefix: string) => {
      Object.entries(formGroup.controls).forEach(([key, control]) => {
        if (control instanceof FormArray) {
          control.value.forEach((value: any, index: number) => {
            formData.append(`${prefix}[${key}][${index}]`, JSON.stringify(value));
          });
        } else {
          formData.append(`${prefix}[${key}]`, control.value ?? '');
        }
      });
    };
  
    appendFormGroupValues(this.firstFormGroup, 'firstFormGroup');
    appendFormGroupValues(this.secondFormGroup, 'secondFormGroup');
    appendFormGroupValues(this.thirdFormGroup, 'thirdFormGroup');
    appendFormGroupValues(this.fourthFormGroup, 'fourthFormGroup');
    appendFormGroupValues(this.fifthFormGroup, 'fifthFormGroup');
    appendFormGroupValues(this.sixthFormGroup, 'sixthFormGroup');
  
    if (this.imageFileReq) {
      formData.append('isr_req_ImgPath', this.imageFileReq, this.imageFileReq.name);
    }
    if (this.imageFileNeed) {
      formData.append('isr_needs_ImgPath', this.imageFileNeed, this.imageFileNeed.name);
    }
  
    return formData;
  }
  prepareDummyFormData(): FormData {
    const formData = new FormData();
    
    // Add hardcoded values for testing
    formData.append('firstFormGroup[user_id]', '1');
    formData.append('firstFormGroup[visit_date]', '2024-09-06T16:53');
    formData.append('firstFormGroup[area_id][]', '1'); // Example value
    formData.append('secondFormGroup[visit_accountName]', 'Test Account');
    formData.append('secondFormGroup[visit_distributor]', 'Test Distributor');
    formData.append('secondFormGroup[visit_salesPersonnel]', 'Test Sales Personnel');
    formData.append('secondFormGroup[visit_accountType][]', '1'); // Example value
    formData.append('thirdFormGroup[isr_id][]', '1'); // Example value
    formData.append('thirdFormGroup[isr_reqOthers]', 'Test ISR Req Others');
    formData.append('thirdFormGroup[isr_needsOthers]', 'Test ISR Needs Others');
    formData.append('fourthFormGroup[visit_payolaMerchandiser]', 'Test Payola Merchandiser');
    formData.append('fifthFormGroup[pod_id][]', '1'); // Example value
    formData.append('fifthFormGroup[cannedPodOthers]', 'Test Canned Pod Others');
    formData.append('sixthFormGroup[pap_id][]', '1'); // Example value
    formData.append('sixthFormGroup[pap_others]', 'Test PAP Others');
    
    // Example of image files (optional for testing)
    // if (this.imageFileReq) {
    //   formData.append('isr_req_ImgPath', this.imageFileReq, this.imageFileReq.name);
    // }
    // if (this.imageFileNeed) {
    //   formData.append('isr_needs_ImgPath', this.imageFileNeed, this.imageFileNeed.name);
    // }
    
    return formData;
  }
  onSubmit(): void {
    if (
      this.firstFormGroup.valid &&
      this.secondFormGroup.valid &&
      this.thirdFormGroup.valid &&
      this.fourthFormGroup.valid &&
      this.fifthFormGroup.valid &&
      this.sixthFormGroup.valid
    ) {
      const dummyFormData = this.prepareDummyFormData();
  
      // Check if image files are available, if not, fetch default images
      const imagePromises: Promise<void>[] = [];
  
      if (this.imageFileReq) {
        dummyFormData.append('fileReq', this.imageFileReq);
      } else {
        imagePromises.push(
          fetch('/no_img.jpg')
            .then(response => {
              if (!response.ok) {
                throw new Error('Failed to fetch default image for req.');
              }
              return response.blob();
            })
            .then(blob => {
              dummyFormData.append('fileReq', blob, 'default_img_req.png');
            })
            .catch(error => console.error('Error fetching default req image:', error))
        );
      }
  
      if (this.imageFileNeed) {
        dummyFormData.append('fileNeed', this.imageFileNeed);
      } else {
        imagePromises.push(
          fetch('/no_img.jpg')
            .then(response => {
              if (!response.ok) {
                throw new Error('Failed to fetch default image for need.');
              }
              return response.blob();
            })
            .then(blob => {
              dummyFormData.append('fileNeed', blob, 'no_img.jpg');
            })
            .catch(error => console.error('Error fetching default need image:', error))
        );
      }
  
      // Wait for any fetches to complete before submitting the form data
      Promise.all(imagePromises)
        .then(() => {
          // Log FormData to verify content
          dummyFormData.forEach((value, key) => console.log(`FormData Key: ${key}, Value: ${value}`));
  
          this.marketVisitsService.createMarketVisits(dummyFormData).subscribe(
            (response) => console.log('Visit successfully created:', response),
            (error) => {
              console.error('Error creating visit:', error);
  
              // Handle validation errors in the response
              if (error.error && error.error.errors) {
                Object.entries(error.error.errors).forEach(([key, messages]) => {
                  if (Array.isArray(messages) && messages.every(msg => typeof msg === 'string')) {
                    console.error(`${key}: ${messages.join(', ')}`);
                  } else {
                    console.error(`${key}: Invalid error format`);
                  }
                });
              }
            }
          );
        })
        .catch((error) => {
          console.error('Error handling form submission:', error);
        });
    } else {
      console.error('Please fill out all required fields.');
    }
  }
  
  onImageSelect(event: Event, type: 'req' | 'need'): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'req') {
          this.imageFileReq = file;
          this.imagePreviewReq = reader.result;
          this.thirdFormGroup.patchValue({ isr_req_ImgPath: file.name });
        } else {
          this.imageFileNeed = file;
          this.imagePreviewNeed = reader.result;
          this.thirdFormGroup.patchValue({ isr_needs_ImgPath: file.name });
        }
        this.cdr.markForCheck(); // Ensure change detection is triggered
      };
      reader.readAsDataURL(file);
    } else {
      // If no file is selected, clear the image preview and file reference
      if (type === 'req') {
        this.imageFileReq = null;
        this.imagePreviewReq = null;
        this.thirdFormGroup.patchValue({ isr_req_ImgPath: null });
      } else {
        this.imageFileNeed = null;
        this.imagePreviewNeed = null;
        this.thirdFormGroup.patchValue({ isr_needs_ImgPath: null });
      }
    }
  }
}  