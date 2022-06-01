INSERT INTO department  (department_name)
VALUES ("Human Resources"),
       ("IT"),
       ("Marketing"),
       ("Adminstration"),
       ("Finance"),
       ("Sales"),
       ("Purchase");

INSERT INTO company_role (title, salary, department_id)
VALUES ("Junior Software Engineer", 80000, 2),
       ("Junior Accountant", 75000, 5),
       ("Lead of people Growth", 100000, 1),
       ("Sales Manager", 80000, 6),
       ("Junior Sales", 70000, 6),
       ("Procurement Specialist", 90000, 7),
       ("Media Manager", 75000, 3),
       ("Administration Officer", 80000, 4),
       ("Project Manager", 90000, 2);


INSERT INTO employee (first_name,last_name,role_id,manager_id)
VALUES ("Rachel","Manning",9,NULL),
       ("Louie","Ip",1,1),
       ("John","Doe",2,NULL),
       ("Tom","Holland",4,NULL),
       ("Nick","Fury",5,4),
       ("James","Bond",8,NULL),
       ("Derek","Johnson",7,NULL),
       ("John","Doe",6,NULL),
       ("King","Kong",5,NULL),
       ("Sea","Nanner",3,NULL),
       ("David","Beckham",6,NULL);

       