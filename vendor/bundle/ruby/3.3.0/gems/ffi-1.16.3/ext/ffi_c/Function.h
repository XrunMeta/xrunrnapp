/*
 * Copyright (c) 2009, Wayne Meissner
 *
 * Copyright (c) 2008-2013, Ruby FFI project contributors
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Ruby FFI project nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

#ifndef RBFFI_FUNCTION_H
#define	RBFFI_FUNCTION_H

#ifdef	__cplusplus
extern "C" {
#endif

# include <stdbool.h>

#include <ffi.h>

typedef struct FunctionType_ FunctionType;

#include "Type.h"
#include "Call.h"
#include "ClosurePool.h"

struct FunctionType_ {
    Type type; /* The native type of a FunctionInfo object */
    VALUE rbReturnType;
    VALUE rbParameterTypes;

    Type* returnType;
    Type** parameterTypes;
    NativeType* nativeParameterTypes;
    ffi_type* ffiReturnType;
    ffi_type** ffiParameterTypes;
    ffi_cif ffi_cif;
    Invoker invoke;
    ClosurePool* closurePool;
    int parameterCount;
    int flags;
    ffi_abi abi;
    int callbackCount;
    VALUE* callbackParameters;
    VALUE rbEnums;
    bool ignoreErrno;
    bool blocking;
    bool hasStruct;
};

extern const rb_data_type_t rbffi_fntype_data_type;
extern VALUE rbffi_FunctionTypeClass, rbffi_FunctionClass;

void rbffi_Function_Init(VALUE moduleFFI);
VALUE rbffi_Function_NewInstance(VALUE functionInfo, VALUE proc);
VALUE rbffi_Function_ForProc(VALUE cbInfo, VALUE proc);
void rbffi_FunctionInfo_Init(VALUE moduleFFI);

#ifdef	__cplusplus
}
#endif

#endif	/* RBFFI_FUNCTION_H */

