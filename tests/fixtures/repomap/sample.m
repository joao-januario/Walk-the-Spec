#import <Foundation/Foundation.h>
#import "AppDelegate.h"

@interface UserService : NSObject
- (void)getUser:(int)userId;
- (void)listUsers;
@end

@implementation UserService
- (void)getUser:(int)userId {
    NSLog(@"Getting user %d", userId);
}
- (void)listUsers {
    NSLog(@"Listing users");
}
@end

@protocol Repository
- (void)save:(id)entity;
- (id)findById:(int)entityId;
@end

void createApp(NSDictionary *config) {
    NSLog(@"Creating app");
}
