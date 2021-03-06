#Makefile for SSLButton
#Andrew W. Hospodor Copyright 2011
# Copyright 2011 Andrew Hospodor. All rights reserved.
# 
# Redistribution and use in source and binary forms, with or without modification, are
# permitted provided that the following conditions are met:
# 
#    1. Redistributions of source code must retain the above copyright notice, this list of
#       conditions and the following disclaimer.
# 
#    2. Redistributions in binary form must reproduce the above copyright notice, this list
#       of conditions and the following disclaimer in the documentation and/or other materials
#       provided with the distribution.
# 
#    3. Neither the name of the Andrew Hospodor, WASP, UCSC, nor the
# 	  names of its contributors may be used to endorse or promote products
# 	  derived from this software without specific prior written permission.
# 
# THIS SOFTWARE IS PROVIDED BY Andrew Hospodor ``AS IS'' AND ANY EXPRESS OR IMPLIED
# WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
# FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Andrew Hospodor OR
# CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
# CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
# SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
# ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
# NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
# ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
# 
# The views and conclusions contained in the software and documentation are those of the
# authors and should not be interpreted as representing official policies, either expressed
# or implied, of Andrew Hospodor.

BUTTONDIR = sslbutton
SSLBUTTONFILES = chrome chrome.manifest defaults install.rdf 
EXTRAS = License README Contributors
EXCLUDEFILES = "*.DS_Store"
XPIFILE = sslbutton.xpi

all : ${XPIFILE}

${XPIFILE} : ${BUTTONDIR}
	cd ${BUTTONDIR}; zip -r ${XPIFILE} ${SSLBUTTONFILES} -x ${EXCLUDEFILES};\
	mv ${XPIFILE} ../${XPIFILE};
	zip ${XPIFILE} ${EXTRAS} -x ${EXCLUDEFILES}

clean :
	rm sslbutton.xpi


