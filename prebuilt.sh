#!/usr/bin/env bash

cd /tmp
wget http://mirror.ctan.org/systems/texlive/tlnet/install-tl-unx.tar.gz
tar -xvzf install-tl-unx.tar.gz
cd install-tl-*
wget https://raw.githubusercontent.com/unshift/pdflatex/master/installation.profile
./install-tl -gui text | yes
tar c texlive | gzip --best > texlive.tar.gz