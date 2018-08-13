#!/usr/bin/env bash

cd /tmp
wget http://mirror.ctan.org/systems/texlive/tlnet/install-tl-unx.tar.gz
tar -xvzf install-tl-unx.tar.gz
cd install-tl-*
wget https://raw.githubusercontent.com/unshift/pdflatex/master/texlive.profile
./install-tl -no-gui -profile texlive.profile
tar c texlive | gzip --best > texlive.tar.gz