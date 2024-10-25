import { Subjects, Publisher, OrderCancelledEvent } from '@tixvibe/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
