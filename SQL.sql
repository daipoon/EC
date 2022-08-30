CREATE TABLE customers(
id INT,
name text,
email text,
password text,
cart1 INT,
cart2 INT,
cart3 INT,
cart4 INT,
cart5 INT,
PRIMARY KEY (id));

CREATE TABLE clothes(
id INT,
name text,
price INT,
size_S boolean,
size_M boolean,
size_L boolean,
size_XL boolean,
category text,
purchased_count INT,
released_at DATE,
PRIMARY KEY (id));

CREATE TABLE contacts(
id INT,
name text,
email text,
title text,
contents text,
PRIMARY KEY (id));


