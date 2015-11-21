# Wrangler collections

This package contains definitions for Wrangler-specific collections as well as file handler definitions. A file handler reads a file uploaded in Wrangler and either create WranglerDocuments for review or writes to the database.


## Installation

In your Meteor app directory, enter:

```
$ meteor add medbook:wrangler-collections
```


## WranglerDocuments

Wrangler documents are generated when Wrangler 'peeks' at the file. They describe and summarize various parts of the file.

The following code will create the panel below in the review step of Wrangler:
```javascript
var submission_id = 'submission_id';
var user_id = 'user_id';
var submission_type = 'submission_type';
var wrangler_file_id = 'wrangler_file_id';

WranglerDocuments.insert({
  submission_id, user_id, submission_type, wrangler_file_id,
  document_type: 'panel_definition',
  contents: {
    name: 'panel_example',
    title: 'Panel heading',
    description: 'Some default panel content here. ...',
    css_class: 'panel-default',
    columns: [
      // NOTE: 'name' is an invalid attribute
      { heading: '#', attribute: 'number', header_of_row: true },
      { heading: 'First Name', attribute: 'first_name' },
      { heading: 'Last Name', attribute: 'last_name' },
      { heading: 'Username', attribute: 'username' },
    ],
  }
});

WranglerDocuments.insert({
  submission_id, user_id, submission_type, wrangler_file_id,
  document_type: 'panel_contents',
  contents: {
    name: 'panel_example',
    number: '1',
    first_name: 'Mark',
    last_name: 'Otto',
    username: '@mdo',
  }
});

// ...
```

![panel_example](images/panel_example.png?raw=true "panel_example")

credit: http://getbootstrap.com/components/

## Installation

File handlers must define this.submission_type before adding any WranglerDocuments.



[Click to edit online](https://jbt.github.io/markdown-editor/#xVRNb9NAEL37V4zUg1vJ2OIahMShcIIWiSAOCCUbe5ws3S/tjmNKlf/OrLPbNB9C4sQhsvPmvX2zMy+5gm9emLVCf2vbQaOhUBQZgi5jIDzCGg16QdjBuEHzLITSIT6EEgQBbRB6qbCG+QYfocPQerlCEKaDMGgtvPyNsOWHHQI44flo27+QFcU8vlul7CjNGlrbIYxSKWg9svdEdcKgghUyB6SZII9biSMEQhcPzL3NiuVy+VNsRezDUcHO3MdKyxCkNQvZwVsoj4DyzUQaAvpUTq+p8IJMjw5P9BFKxDG1sIgXS0edYkwtzuZfS8OOdP1UwHGvVe6qOu2iOnOrWJy3N1FmvKY4tkWHvTSSWFpGUmsNRdcZRD8AI/SBi7+EdgonIgBJUrH2eRr/BkXHG0q1/aZdPJYZX6xGhnoxKErbSj4s87zmuq6TsA1h0SoRQjZ9lXS5btWgDVe/T18Bmgbu7ufvmR5bLUFyOA3HYCsUD1kQceAGwsR+yn0y/6qsDvWoH/QKfQm76gL5g/SB4C5aHKv6WFjsvS8qP4rLQr7kX3VfebnmXDZkOKt+xMeu2N38h/DktPxrdPaj5uLrBBymyOAn4R8S/jwkhu+JbILzEBh9p7s9mkbAeeA0xd/59L6/P0gt1jiFDa75n6OTnDwiN2uaNdLKWgrkhatbqxv+OGviRZqbPw==)
