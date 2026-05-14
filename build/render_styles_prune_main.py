from sys import argv

filename = argv[1]

lines = []
with open(filename, 'r') as f:

    include = True
    for line in f:

        change = False
        linem = line[:-1]
        if linem == "/* MAIN_START */":
            change = False != include
            include = False
        elif linem == "/* MAIN_END */":
            change = True != include
            include = True
        
        if include and not change:
            lines.append(line)

with open(filename, 'w') as f:
    for line in lines:
        f.write(line)