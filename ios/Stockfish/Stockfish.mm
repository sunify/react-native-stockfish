//
//  Stockfish.m
//  Stockfish
//
//  Created by Александр Лунев on 20.01.17.
//  Copyright © 2017 Александр Лунев. All rights reserved.
//

#include <pthread.h>
#import <React/RCTBridge.h>
#import <React/RCTEventDispatcher.h>
#import <React/RCTLog.h>

#import "Stockfish.h"
#include "../Engine/iphone.h"

Stockfish *GlobalEngineController; // HACK

@implementation Stockfish

@synthesize bridge = _bridge;
@synthesize engineIsThinking, engineThreadIsRunning;

RCT_EXPORT_MODULE();


RCT_REMAP_METHOD(createEngine,
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    [self initEngine];
    resolve(NULL);
}

RCT_EXPORT_METHOD(sendCommand: (NSString *)command)
{
    [commandQueue push: command];
}

RCT_EXPORT_METHOD(commit)
{
    [self commitCommands];
}

- (id)initEngine {
    GlobalEngineController = self;
    commandQueue = [[Queue alloc] init];
    
    // Initialize locks and conditions
    pthread_mutex_init(&WaitConditionLock, NULL);
    pthread_cond_init(&WaitCondition, NULL);
    
    // Start engine thread
    NSThread *thread =
    [[NSThread alloc] initWithTarget: self
                            selector: @selector(startEngine:)
                              object: nil];
    [thread setStackSize: 0x100000];
    [thread start];
    [thread release];
    
    ignoreBestmove = NO;
    engineIsThinking = NO;
    
    return self;
}

- (void)startEngine:(id)anObject {
    NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
    
    engineThreadIsRunning = YES;
    engineThreadShouldStop = NO;
    
    engine_init();
    
    while (!engineThreadShouldStop) {
        pthread_mutex_lock(&WaitConditionLock);
        if ([commandQueue isEmpty])
            pthread_cond_wait(&WaitCondition, &WaitConditionLock);
        pthread_mutex_unlock(&WaitConditionLock);
        while (![commandQueue isEmpty]) {
            NSString *command = [commandQueue pop];
            if ([command hasPrefix: @"go"])
                engineIsThinking = YES;
            command_to_engine([command UTF8String]);
            engineIsThinking = NO;
        }
    }
    
    NSLog(@"engine is quitting");
    [pool release];
    engineThreadIsRunning = NO;
}


- (void)abortSearch {
    NSLog(@"aborting search");
    [self sendCommand: @"stop"];
}


- (void)commitCommands {
    NSLog(@"commiting commands");
    pthread_mutex_lock(&WaitConditionLock);
    pthread_cond_signal(&WaitCondition);
    pthread_mutex_unlock(&WaitConditionLock);
}


- (BOOL)commandIsWaiting {
    return ![commandQueue isEmpty];
}


- (NSString *)getCommand {
    assert(![commandQueue isEmpty]);
    return [commandQueue pop];
}


- (void)sendPV:(NSString *)pv {
    NSLog(@"pv %@", pv);
    [self.bridge.eventDispatcher sendAppEventWithName:@"engine_pv" body:@{@"pv": pv}];
}

- (void)sendInfo: (id)info {
    NSLog(@"sendInfo");
    [self.bridge.eventDispatcher sendAppEventWithName:@"engine_info" body:info];
}

- (void)sendEval:(NSString *)result {
    NSLog(@"eval %@", result);
    [self.bridge.eventDispatcher sendAppEventWithName:@"engine_eval" body:@{@"result": result}];
}


- (void)sendSearchStats:(NSString *)searchStats {
    NSLog(@"search stats %@", searchStats);
    [self.bridge.eventDispatcher sendAppEventWithName:@"engine_searchStats" body:@{@"searchStats": searchStats}];
}


- (void)sendBestMove:(NSString *)bestMove ponderMove:(NSString *)ponderMove {
    NSLog(@"received best move: %@ ponder move: %@", bestMove, ponderMove);
    if (!ignoreBestmove) {
        [self.bridge.eventDispatcher sendAppEventWithName:@"engine_bestMove" body:@{@"bestMove": bestMove, @"ponderMove": ponderMove}];
    } else {
        NSLog(@"ignoring best move");
        ignoreBestmove = NO;
    }
}


- (void)ponderhit {
    NSLog(@"Ponder hit");
    [self sendCommand: @"ponderhit"];
}


- (void)pondermiss {
    NSLog(@"Ponder miss");
    ignoreBestmove = YES;
    [self sendCommand: @"stop"];
}


- (void)dealloc {
    NSLog(@"EngineController dealloc");
    [commandQueue release];
    pthread_cond_destroy(&WaitCondition);
    pthread_mutex_destroy(&WaitConditionLock);
    [super dealloc];
}


- (void)quit {
    ignoreBestmove = YES;
    engineThreadShouldStop = YES;
    [self sendCommand: @"quit"];
    [self commitCommands];
    NSLog(@"waiting for engine thread to exit...");
    while (![NSThread isMultiThreaded]);
    NSLog(@"engine thread exited");
}

@end
