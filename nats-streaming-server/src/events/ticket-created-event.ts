// @ Interface that describes coupling of one particular Subject with specific 
// structure of data
import { Subjects } from "./subjects";

// Set up tight coupling between very specific subject name and structure of 
// data on the event 
// Every different event we ever expect to have inside of our application, we
// are gonna create a different interface for
// That's going to make sure that TypeScript can step in and make sure that we  
// have some matching subject and data inside of one of the custom listeners

export interface TicketCreatedEvent {
  subject: Subjects.TicketCreated;
  data: {
    id: string;
    title: string;
    price: number;
  }
}
