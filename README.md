# time-windows-routing-task
Script that find routes for given points by distance between them and service time windows at that points

Execute following commands from project route directory, to use predefined nodes data and distances: 

```
node index
```

There are options for command:

```
TEST=<test nodes amount> - generate given amount of nodes data and distances
SHOW_ROUTES - show calculated routes
SAVE_DATA - save generated nodes data and distances to disk
```

#### To run program with 1000 test nodes and showing routes after execution:

```
node index TEST=1000 SHOW_ROUTES
```
