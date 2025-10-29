import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecordModal } from './record-modal';

describe('RecordModal', () => {
  let component: RecordModal;
  let fixture: ComponentFixture<RecordModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordModal]
    }).compileComponents();

    fixture = TestBed.createComponent(RecordModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

