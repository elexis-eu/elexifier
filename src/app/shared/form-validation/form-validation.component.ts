import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-form-validation',
  templateUrl: './form-validation.component.html',
  styleUrls: ['./form-validation.component.scss'],
})
export class FormValidationComponent implements OnChanges {
  @Input() public control: AbstractControl;
  @Input() public showErrors: AbstractControl;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.showErrors && !changes.showErrors.firstChange) {
      this.showErrors = changes.showErrors.currentValue;
    }
  }
}
