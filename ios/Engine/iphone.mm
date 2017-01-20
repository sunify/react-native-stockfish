////
//// Includes
////

#import "EngineSelfManager.h"
#import "PGN.h"

#include <iomanip>
#include <string>
#include <sstream>

#include "iphone.h"

#include "book.h"
#include "bitboard.h"
#include "evaluate.h"
#include "position.h"
#include "search.h"
#include "thread.h"
#include "tt.h"
#include "ucioption.h"

using std::string;

namespace {
  string CurrentMove;
  int CurrentMoveNumber, TotalMoveCount;
}

////
//// Functions
////

void engine_init() {
  UCI::init(Options);
  Bitboards::init();
  Position::init();
  Bitbases::init_kpk();
  Search::init();
  Pawns::init();
  Eval::init();
  Threads.init();
  TT.resize(Options["Hash"]);
  
  UCI::commandInit();
}

void info_to_ui(int depth, const string &score, int nodes, uint64_t time, int multipv, const string &pv) {
  [GlobalEngineController performSelectorOnMainThread: @selector(sendInfo:)
                                           withObject: @{
                                                         @"pv": [NSString stringWithUTF8String: pv.c_str()],
                                                         @"score": [NSString stringWithUTF8String: score.c_str()],
                                                         @"depth": [NSNumber numberWithInt: depth],
                                                         @"nodes": [NSNumber numberWithInt: nodes],
                                                         @"multipv": [NSNumber numberWithInt: multipv],
                                                         @"time": [NSNumber numberWithUnsignedLongLong: time],
                                                         }
                                        waitUntilDone: NO];
}

void pv_to_ui(const string &pv) {
  [GlobalEngineController performSelectorOnMainThread: @selector(sendPV:)
                          withObject:
                            [NSString stringWithUTF8String: pv.c_str()]
                          waitUntilDone: NO];
}

void eval_to_ui(const string &result) {
  [GlobalEngineController performSelectorOnMainThread: @selector(sendEval:)
                          withObject:
                            [NSString stringWithUTF8String: result.c_str()]
                          waitUntilDone: NO];
}

void currmove_to_ui(const string currmove, int currmovenum, int movenum) {
  CurrentMove = currmove;
  CurrentMoveNumber = currmovenum;
  TotalMoveCount = movenum;
}

void searchstats_to_ui(int depth, int64_t nodes, int time) {
  std::stringstream s;
  s << " " << "  " << depth
    << "  " << CurrentMove
    << " (" << CurrentMoveNumber << "/" << TotalMoveCount << ")"
    << "  " << nodes/1000 << "kN";
  if(time > 0)
    s << std::setiosflags(std::ios::fixed) << std::setprecision(1)
      << "  " <<  (nodes*1.0) / time << "kN/s";
  [GlobalEngineController performSelectorOnMainThread:
                            @selector(sendSearchStats:)
                          withObject:
                            [NSString stringWithUTF8String: s.str().c_str()]
                          waitUntilDone: NO];
}

void bestmove_to_ui(const string &best, const string &ponder) {
  [GlobalEngineController
    sendBestMove: [NSString stringWithUTF8String: best.c_str()]
    ponderMove: [NSString stringWithUTF8String: ponder.c_str()]];
}

void command_to_engine(const string &command) {
  UCI::command(command);
}

bool command_is_waiting() {
  return [GlobalEngineController commandIsWaiting];
}

string get_command() {
  return string([[GlobalEngineController getCommand] UTF8String]);
}

string kpk_bitbase_filename() {
  return string([[PGN_DIRECTORY stringByAppendingPathComponent: @"kpk.bin"]
                  UTF8String]);
}
