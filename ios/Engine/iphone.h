#if !defined(IPHONE_H_INCLUDED)
#define IPHONE_H_INCLUDED

#define IPHONE_GLAURUNG

////
//// Prototypes
////

#include <string>

extern void engine_init();
extern void info_to_ui(int depth, const std::string &score, int nodes, uint64_t time, int multipv, const std::string &pv);
extern void eval_to_ui(const std::string &result);
extern void pv_to_ui(const std::string &pv);
extern void currmove_to_ui(const std::string currmove, int currmovenum,
                           int movenum);
extern void bestmove_to_ui(const std::string &best, const std::string &ponder, const std::string &score);
extern void searchstats_to_ui(int depth, int64_t nodes, int time);
extern void command_to_engine(const std::string &command);
extern bool command_is_waiting();
extern std::string get_command();
extern std::string kpk_bitbase_filename();

#endif // !defined(IPHONE_H_INCLUDED)
