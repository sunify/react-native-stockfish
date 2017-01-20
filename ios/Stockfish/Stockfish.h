//
//  Stockfish.h
//  Stockfish
//
//  Created by Александр Лунев on 20.01.17.
//  Copyright © 2017 Александр Лунев. All rights reserved.
//

#import <React/RCTBridgeModule.h>
#import "Queue.h"

@interface Stockfish : NSObject <RCTBridgeModule> {
    Queue *commandQueue;
    pthread_cond_t WaitCondition;
    pthread_mutex_t WaitConditionLock;
    BOOL ignoreBestmove;
    BOOL engineThreadShouldStop;
    BOOL engineThreadIsRunning;
    BOOL engineIsThinking;
}

@property (nonatomic, readonly) BOOL engineIsThinking;
@property (nonatomic, readonly) BOOL engineThreadIsRunning;
@property (nonatomic, assign) RCTBridge *bridge;

- (id)initEngine;
- (void)startEngine:(id)anObject;
- (void)sendCommand:(NSString *)command;
- (void)abortSearch;
- (void)commitCommands;
- (BOOL)commandIsWaiting;
- (NSString *)getCommand;
- (void)sendInfo: (id)info;
- (void)sendEval:(NSString *)result;
- (void)sendPV:(NSString *)pv;
- (void)sendSearchStats:(NSString *)searchStats;
- (void)sendBestMove:(NSString *)bestMove ponderMove:(NSString *)ponderMove;
- (void)ponderhit;
- (void)pondermiss;
- (void)quit;
- (BOOL)engineIsThinking;

@end

extern Stockfish *GlobalEngineController; // HACK


