import { Subjects, Publisher, PaymentCreatedEvent } from '@tixvibe/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
