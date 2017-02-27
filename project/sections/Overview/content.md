# Project Overview

### Info

**Company** : Adobe Systems, Inc.
**Date** : January, 2017

### Description

This project is a simple project intended to create an AEM build-kit.
This build-kit is a result of an AEM discovery in which various project
information; such as styleguides, caching policies, and component definitions
are determinded.

### Structure

The overall project structure is broken down into the following:

#### /views

This folder contains the presentation files for the system. The view templates use the nunjucks template library for rendering.

#### /static

This folder contains all the static elements of the site;
such as the bootstrap and syntax-highlighter CSS and JS files.
Most files in this directory can be access via the
web-app through the use of the `/assets` context path.

#### /project/sections

This is the core of the project. This folder has a specific
structure that outlines the manner in which the site can be
built. The playbook will render the first two levels beyond
`/project/sections`. Therefore, a folder-structure of
`/project/sections/overview/project-team` would have two levels:
overview with a child of project team.

The folder names will be used during the creation and display
of the navigation. These folder names will also have significance
for the URL and are url-encoded. Therefore, a folder with a
name of "Title Component" will render as /Title%20Component.

Beyond the folder structure, each **must** contain a *content.md*
file. This file will be used to render the output for that page.

Additionally, folders **may** also contain the following:

  - **meta.json** - This file can have various additional meta
  information that can be used by the system for additional
  functionality, such as determining view-type.
  - **component.html** - This file will be used by the system
  to render a component html snippet. This will also be used
  when referenced in prototype files.


### TODO

1. Add a configurable site-root that allows for the creation of views from a configurable location