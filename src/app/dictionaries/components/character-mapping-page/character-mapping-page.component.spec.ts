import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterMappingPageComponent } from './character-mapping-page.component';

describe('CharacterMappingPageComponent', () => {
  let component: CharacterMappingPageComponent;
  let fixture: ComponentFixture<CharacterMappingPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CharacterMappingPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CharacterMappingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
