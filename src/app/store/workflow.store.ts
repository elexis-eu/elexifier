import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {Dictionary} from '@elexifier/dictionaries/core/type/dictionary.interface';
import {Headword} from '@elexifier/dictionaries/core/type/headword.interface';
import {TransformationService} from '@elexifier/dictionaries/core/transformation.service';
/**
 *  Disabling tslint for Greater Good
 */

/* tslint:disable */

@Injectable({
  providedIn: 'root',
})
export class WorkflowStore {

  public get type(): string {
    return this._type.getValue();
  }

  public set type(val: string) {
    this._type.next(val);
  }

  private readonly _type = new BehaviorSubject<string>('');

  public readonly type$ = this._type.asObservable();

  /**
   * Selected transformation
   */

  public get selectedTransformation(): any {
    return this._selectedTransformation.getValue();
  }

  public set selectedTransformation(val: any) {
    this._selectedTransformation.next(val);
  }

  private readonly _selectedTransformation = new BehaviorSubject<any>(null);

  public readonly selectedTransformation$ = this._selectedTransformation.asObservable();

  /**
   * Selected dictionary
   */

  public get selectedDictionary(): Dictionary {
    return this._selectedDictionary.getValue();
  }

  public set selectedDictionary(val: Dictionary) {
    this._selectedDictionary.next(val);
  }

  private readonly _selectedDictionary = new BehaviorSubject<Dictionary>(null);

  public readonly selectedDictionary$ = this._selectedDictionary.asObservable();


  /**
   * Selected headword
   */

  public get selectedHeadword(): Headword {
    return this._selectedHeadword.getValue();
  }

  public set selectedHeadword(val: Headword) {
    this._selectedHeadword.next(val);
  }

  private readonly _selectedHeadword = new BehaviorSubject<Headword>(null);

  public readonly selectedHeadword$ = this._selectedHeadword.asObservable();


  /**
   * Strip settings in output
   */

  public get stripSettings(): any {
    return this._stripSettings.getValue();
  }

  public set stripSettings(val: any) {
    this._stripSettings.next(val);
  }

  private readonly _stripSettings = new BehaviorSubject<{ dictScrap: boolean, namespaces: boolean, teiHeader: boolean}>({
    dictScrap: false, namespaces: false, teiHeader: false,
  });

  public readonlystripSettingsy$ = this._stripSettings.asObservable();


  public constructor() {}
}
