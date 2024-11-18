import { Subjects, Publisher, ExpirationCompleteEvent } from '@tixvibe/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
